import os
import logging
from flask import Flask, request, jsonify
from utils import upload_to_s3
from werkzeug.exceptions import BadRequest

# Initialize Flask app
app = Flask(__name__)

@app.route('/compile', methods=['POST'])
def compile_endpoint():
    try:
        # Validate request body
        if not request.is_json:
            raise BadRequest("Content-Type must be application/json")

        data = request.get_json()
        
        # Validate required fields
        if not isinstance(data, dict):
            raise BadRequest("Request body must be a JSON object")
            
        write_url = data.get('writeUrl')
        read_url = data.get('readUrl')
        
        if not write_url or not read_url:
            raise BadRequest("writeUrl and readUrl are required fields")
            
        if not isinstance(write_url, str) or not isinstance(read_url, str):
            raise BadRequest("writeUrl and readUrl must be strings")

        tarball_path = "./source-code.tar.gz"

        # Upload to S3
        logging.info(f"Uploading tarball to S3 using pre-signed URL: {write_url}")
        upload_to_s3(tarball_path, write_url)

        return jsonify({
            "status": "success",
            "message": "Tarball created and uploaded successfully"
        }), 200

    except BadRequest as e:
        logging.error(f"Bad request: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400
    except Exception as e:
        logging.error(f"Internal server error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "status": "error",
        "message": "Endpoint not found"
    }), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({
        "status": "error",
        "message": "Method not allowed"
    }), 405

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
