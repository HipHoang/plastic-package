import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)


def upload_image(file):
    result = cloudinary.uploader.upload(file)
    return result["secure_url"]

def upload_lesson_file(file, resource_type="auto", folder="lessons"):
    result = cloudinary.uploader.upload(
        file,
        resource_type=resource_type,
        folder=folder
    )
    return result["secure_url"]

