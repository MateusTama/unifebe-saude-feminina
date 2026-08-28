import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    host = os.environ.get("HOST", "127.0.0.1")
    porta = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    app.run(host=host, port=porta, debug=debug)
