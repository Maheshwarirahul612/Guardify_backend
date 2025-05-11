# instagram_fetcher.py
import instaloader
import sys
import json

def fetch_instagram_posts(username, max_count=5):
    loader = instaloader.Instaloader(download_comments=False, save_metadata=False, download_video_thumbnails=False)
    
    posts_data = []
    try:
        profile = instaloader.Profile.from_username(loader.context, username)
        for post in profile.get_posts():
            posts_data.append({
                "url": post.url,
                "caption": post.caption,
                "is_video": post.is_video,
                "date": post.date_utc.strftime("%Y-%m-%d %H:%M:%S"),
            })
            if len(posts_data) >= max_count:
                break
    except Exception as e:
        print(f"Error fetching Instagram posts: {e}")
        return []

    return posts_data

# Entry point
if __name__ == "__main__":
    if len(sys.argv) > 1:
        username = sys.argv[1]
        posts = fetch_instagram_posts(username)
        print(json.dumps(posts))  # Print the posts as JSON to stdout
