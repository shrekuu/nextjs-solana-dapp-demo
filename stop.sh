# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

SERVICE_NAME="$DEPLOYMENT_APP_NAME"
PORT="$DEPLOYMENT_PORT"

# Stop and delete the service if it exists
pm2 delete "$SERVICE_NAME" > /dev/null 2>&1

# Show service status
pm2 status "$SERVICE_NAME"
