use axum::{
    extract::{Path, State},
    response::sse::{Event, KeepAlive, Sse},
};
use sqlx::MySqlPool;
use std::convert::Infallible;
use std::time::Duration;

/// GET /api/status/:id  — Server-Sent Events stream of generation progress
pub async fn stream(
    Path(id): Path<String>,
    State(pool): State<MySqlPool>,
) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>> + Send + 'static> {
    let s = async_stream::stream! {
        loop {
            // Query current state from DB
            let row: Option<(String, i32, Option<String>)> = sqlx::query_as(
                "SELECT status, progress, video_url FROM generations WHERE id = ?",
            )
            .bind(&id)
            .fetch_optional(&pool)
            .await
            .ok()
            .flatten();

            match row {
                None => {
                    // Job not found — send error and close
                    let data = serde_json::json!({ "status": "failed", "progress": 0 });
                    yield Ok::<_, Infallible>(
                        Event::default().data(data.to_string())
                    );
                    break;
                }
                Some((status, progress, video_url)) => {
                    let data = serde_json::json!({
                        "status":   status,
                        "progress": progress,
                        "videoUrl": video_url,
                    });

                    yield Ok::<_, Infallible>(
                        Event::default().data(data.to_string())
                    );

                    // Stop streaming once terminal state is reached
                    if status == "done" || status == "failed" {
                        break;
                    }
                }
            }

            // Poll every 2 seconds
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    };

    Sse::new(s).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("ping"),
    )
}
