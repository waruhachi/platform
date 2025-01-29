import requests
import logging
from werkzeug.exceptions import InternalServerError

def upload_to_s3(file_path, presigned_url):
    """
    Upload a file to S3 using a pre-signed URL
    """
    try:
        with open(file_path, 'rb') as f:
            response = requests.put(
                presigned_url,
                data=f,
                headers={'Content-Type': 'application/gzip'}
            )
            
            if response.status_code != 200:
                print(response)
                print(response.text)
                logging.error(f"S3 upload failed with status code {response.status_code}")
                raise InternalServerError("Failed to upload to S3")
                
            logging.info("Successfully uploaded to S3")
            
    except Exception as e:
        logging.error(f"Failed to upload to S3: {str(e)}")
        raise InternalServerError("Failed to upload to S3")
