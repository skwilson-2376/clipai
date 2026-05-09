use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{Html, Redirect},
    Json,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::MySqlPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::AppState;

// ── Platform config ───────────────────────────────────────────────────────────

struct PlatformCfg {
    auth_url:     &'static str,
    token_url:    &'static str,
    id_env:       &'static str,
    secret_env:   &'static str,
    scope:        &'static str,
    id_param:     &'static str, // "client_id" or "client_key" (TikTok)
    needs_pkce:   bool,
}

fn cfg(platform: &str) -> Option<PlatformCfg> {
    match platform {
        "tiktok" => Some(PlatformCfg {
            auth_url:   "https://www.tiktok.com/v2/auth/authorize",
            token_url:  "https://open.tiktokapis.com/v2/oauth/token/",
            id_env:     "TIKTOK_CLIENT_KEY",
            secret_env: "TIKTOK_CLIENT_SECRET",
            scope:      "video.upload,video.publish",
            id_param:   "client_key",
            needs_pkce: false,
        }),
        "reels" => Some(PlatformCfg {
            auth_url:   "https://api.instagram.com/oauth/authorize",
            token_url:  "https://api.instagram.com/oauth/access_token",
            id_env:     "INSTAGRAM_APP_ID",
            secret_env: "INSTAGRAM_APP_SECRET",
            scope:      "instagram_basic,instagram_content_publish",
            id_param:   "client_id",
            needs_pkce: false,
        }),
        "shorts" => Some(PlatformCfg {
            auth_url:   "https://accounts.google.com/o/oauth2/v2/auth",
            token_url:  "https://oauth2.googleapis.com/token",
            id_env:     "YOUTUBE_CLIENT_ID",
            secret_env: "YOUTUBE_CLIENT_SECRET",
            scope:      "https://www.googleapis.com/auth/youtube.upload",
            id_param:   "client_id",
            needs_pkce: false,
        }),
        "twitter" => Some(PlatformCfg {
            auth_url:   "https://twitter.com/i/oauth2/authorize",
            token_url:  "https://api.twitter.com/2/oauth2/token",
            id_env:     "TWITTER_CLIENT_ID",
            secret_env: "TWITTER_CLIENT_SECRET",
            scope:      "tweet.write users.read offline.access",
            id_param:   "client_id",
            needs_pkce: true,
        }),
        _ => None,
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn generate_verifier() -> String {
    let bytes: Vec<u8> = (0..32).map(|_| rand::thread_rng().gen()).collect();
    URL_SAFE_NO_PAD.encode(bytes)
}

fn verifier_to_challenge(verifier: &str) -> String {
    let hash = Sha256::digest(verifier.as_bytes());
    URL_SAFE_NO_PAD.encode(hash)
}

fn frontend_url() -> String {
    std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3002".into())
}

fn backend_url() -> String {
    std::env::var("APP_URL").unwrap_or_else(|_| "http://localhost:8080".into())
}

fn redirect_uri(platform: &str) -> String {
    format!("{}/api/oauth/{}/callback", backend_url(), platform)
}

// ── /api/oauth/:platform/start ────────────────────────────────────────────────

pub async fn start(
    Path(platform): Path<String>,
    State(state): State<AppState>,
) -> Result<Redirect, (StatusCode, String)> {
    let p = cfg(&platform).ok_or_else(|| (StatusCode::NOT_FOUND, "Unknown platform".into()))?;

    let client_id = std::env::var(p.id_env).unwrap_or_else(|_| {
        tracing::warn!("{} not set — OAuth will fail", p.id_env);
        "CONFIGURE_IN_ENV".into()
    });

    let oauth_state = Uuid::new_v4().to_string();
    let redirect    = urlencoding::encode(&redirect_uri(&platform)).into_owned();
    let scope       = urlencoding::encode(p.scope).into_owned();

    let auth_url = if p.needs_pkce {
        let verifier  = generate_verifier();
        let challenge = verifier_to_challenge(&verifier);
        {
            let mut store = state.oauth_states.lock().await;
            store.insert(oauth_state.clone(), crate::OAuthEntry { platform: platform.clone(), verifier: Some(verifier) });
        }
        format!(
            "{auth}?response_type=code&{id_param}={cid}&redirect_uri={ru}&scope={scope}\
             &state={s}&code_challenge={ch}&code_challenge_method=S256",
            auth     = p.auth_url,
            id_param = p.id_param,
            cid      = urlencoding::encode(&client_id),
            ru       = redirect,
            scope    = scope,
            s        = oauth_state,
            ch       = challenge,
        )
    } else {
        {
            let mut store = state.oauth_states.lock().await;
            store.insert(oauth_state.clone(), crate::OAuthEntry { platform: platform.clone(), verifier: None });
        }
        let extra = if platform == "shorts" { "&access_type=offline&prompt=consent" } else { "" };
        format!(
            "{auth}?response_type=code&{id_param}={cid}&redirect_uri={ru}&scope={scope}&state={s}{extra}",
            auth     = p.auth_url,
            id_param = p.id_param,
            cid      = urlencoding::encode(&client_id),
            ru       = redirect,
            scope    = scope,
            s        = oauth_state,
            extra    = extra,
        )
    };

    Ok(Redirect::temporary(&auth_url))
}

// ── /api/oauth/:platform/callback ─────────────────────────────────────────────

#[derive(Deserialize)]
pub struct CallbackQuery {
    code:              Option<String>,
    state:             Option<String>,
    error:             Option<String>,
    error_description: Option<String>,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token:  Option<String>,
    refresh_token: Option<String>,
    token_type:    Option<String>,
    expires_in:    Option<i64>,
    scope:         Option<String>,
    // TikTok fields
    open_id:       Option<String>,
    // Twitter
    #[serde(rename = "token_type")]
    _token_type:   Option<String>,
}

pub async fn callback(
    Path(platform): Path<String>,
    Query(params): Query<CallbackQuery>,
    State(state): State<AppState>,
) -> Redirect {
    let fe = frontend_url();
    let err_redirect = |msg: &str| {
        Redirect::temporary(&format!("{}/connect?platform={}&status=error&msg={}", fe, platform, urlencoding::encode(msg)))
    };

    // OAuth error from platform
    if let Some(err) = &params.error {
        let desc = params.error_description.as_deref().unwrap_or(err);
        tracing::warn!("OAuth error from {}: {} — {}", platform, err, desc);
        return err_redirect(desc);
    }

    let code = match &params.code {
        Some(c) => c.clone(),
        None    => return err_redirect("No authorization code received"),
    };

    let oauth_state = params.state.as_deref().unwrap_or("");
    let entry = {
        let mut store = state.oauth_states.lock().await;
        store.remove(oauth_state)
    };

    let p = match cfg(&platform) {
        Some(p) => p,
        None    => return err_redirect("Unknown platform"),
    };

    let client_id     = std::env::var(p.id_env).unwrap_or_default();
    let client_secret = std::env::var(p.secret_env).unwrap_or_default();
    let redirect      = redirect_uri(&platform);

    // Build token exchange form
    let mut form: HashMap<&str, String> = HashMap::new();
    form.insert("grant_type",   "authorization_code".into());
    form.insert("code",         code.clone());
    form.insert("redirect_uri", redirect.clone());

    if platform == "tiktok" {
        form.insert("client_key",    client_id.clone());
        form.insert("client_secret", client_secret.clone());
    } else {
        form.insert("client_id",     client_id.clone());
        form.insert("client_secret", client_secret.clone());
    }

    if p.needs_pkce {
        if let Some(entry) = &entry {
            if let Some(ref verifier) = entry.verifier {
                form.insert("code_verifier", verifier.clone());
            }
        }
    }

    // Exchange code for token
    let http = reqwest::Client::new();
    let resp = http.post(p.token_url).form(&form).send().await;

    let token_resp: TokenResponse = match resp {
        Ok(r) => match r.json().await {
            Ok(t)  => t,
            Err(e) => { tracing::error!("Token parse error ({}): {}", platform, e); return err_redirect("Token exchange failed"); }
        },
        Err(e) => { tracing::error!("Token request error ({}): {}", platform, e); return err_redirect("Token request failed"); }
    };

    let access_token = match token_resp.access_token {
        Some(t) => t,
        None    => return err_redirect("No access token in response"),
    };

    let expires_at = token_resp.expires_in.map(|secs| {
        chrono::Utc::now() + chrono::Duration::seconds(secs)
    });

    // Store in DB
    let result = sqlx::query!(
        r#"
        INSERT INTO social_tokens
          (platform, access_token, refresh_token, token_type, scope, expires_at, platform_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          access_token   = VALUES(access_token),
          refresh_token  = VALUES(refresh_token),
          token_type     = VALUES(token_type),
          scope          = VALUES(scope),
          expires_at     = VALUES(expires_at),
          platform_user_id = VALUES(platform_user_id),
          updated_at     = CURRENT_TIMESTAMP
        "#,
        platform,
        access_token,
        token_resp.refresh_token,
        token_resp.token_type.unwrap_or_else(|| "Bearer".into()),
        token_resp.scope,
        expires_at.map(|dt| dt.naive_utc()),
        token_resp.open_id,
    )
    .execute(&state.pool)
    .await;

    if let Err(e) = result {
        tracing::error!("DB error storing token for {}: {}", platform, e);
        return err_redirect("Failed to save connection");
    }

    tracing::info!("Connected platform: {}", platform);
    Redirect::temporary(&format!("{}/connect?platform={}&status=success", fe, platform))
}
