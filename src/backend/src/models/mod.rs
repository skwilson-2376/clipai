use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Generation {
    pub id: String,
    pub prompt: String,
    pub style: String,
    pub aspect_ratio: String,
    pub platform: String,
    pub resolution: String,
    pub duration: i32,
    pub motion_intensity: i32,
    pub creativity: i32,
    pub status: String,
    pub progress: i32,
    pub video_url: Option<String>,
    pub thumbnail_gradient: Option<String>,
    pub is_uploaded: i8,
    pub created_at: String,   // formatted by SQL as ISO 8601
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Character {
    pub id: String,
    pub name: String,
    pub source: String,
    pub image_url: Option<String>,
    pub description: Option<String>,
    pub gradient: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Post {
    pub id: String,
    pub generation_id: String,
    pub platforms: String,
    pub caption: Option<String>,
    pub status: String,
    pub created_at: String,
}
