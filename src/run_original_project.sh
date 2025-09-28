echo "Starting Tools4MSP GeoMeaning Project (Original Configuration)..."

set -a

if [ ! -f "../.override_dev_env" ]; then
    echo "Error: Environment file .override_dev_env not found!"
    echo "Make sure you're running this script from the src/ directory"
    echo "and that .override_dev_env exists in the parent directory."
    exit 1
fi

echo "Loading environment from .override_dev_env..."
source ../.override_dev_env

export PYTHONPATH=/Users/gius/Gisdevio/tools4msp_geoplatform/src
export GDAL_CONFIG=/opt/homebrew/bin/gdal-config
export GDAL_VERSION=3.11.3

export JAVA_HOME="/opt/homebrew/opt/openjdk@11"
export PATH="$JAVA_HOME/bin:$PATH"

export SESSION_EXPIRED_CONTROL_ENABLED=False

if command -v python3.11 >/dev/null 2>&1; then
    PYTHON="python3.11"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON="python"
else
    echo "Error: No Python interpreter found!"
    echo "Please ensure Python 3.x is installed and available in PATH"
    exit 1
fi

echo "Using Python interpreter: $PYTHON ($(which $PYTHON))"

if [ -z "$TOOLS4MSP_API_URL" ]; then
    echo "Warning: TOOLS4MSP_API_URL not set! This may cause upload errors."
    echo "Make sure .override_dev_env is properly configured."
fi

if [ -z "$DJANGO_SETTINGS_MODULE" ]; then
    echo "Warning: DJANGO_SETTINGS_MODULE not set!"
    echo "Make sure .override_dev_env is properly configured."
fi

echo "Environment configured for original project"
echo "Using settings: $DJANGO_SETTINGS_MODULE"
echo "Tools4MSP API URL: $TOOLS4MSP_API_URL"

case "$1" in
    "setup")
        echo "Setting up database..."
        $PYTHON manage.py migrate
        echo "Create superuser with:"
        echo "   $PYTHON manage.py createsuperuser"
        ;;
        
    "start")
        echo "Starting the original Tools4MSP GeoMeaning project..."
        echo "Server will be available at: $SITEURL"
        $PYTHON manage.py runserver localhost:8000
        ;;
        
    "sync")
        echo "Synchronizing database..."
        $PYTHON manage.py makemigrations
        $PYTHON manage.py migrate
        ;;
        
    "shell")
        echo "Opening Django shell..."
        $PYTHON manage.py shell
        ;;
        
    "check")
        echo "Checking project configuration..."
        $PYTHON manage.py check
        ;;
        
    "restart")
        echo "Stopping any existing Django servers..."
        pkill -f "manage.py runserver" || true
        sleep 2
        echo "Starting GeoServer..."
        ./run_original_project.sh start-geoserver &
        sleep 5
        echo "Starting the original Tools4MSP GeoMeaning project..."
        echo "Server will be available at: $SITEURL"
        $PYTHON manage.py runserver localhost:8000
        ;;
        
    "start-geoserver")
        echo "Starting GeoServer on port 8080..."
        
        # Check if GeoServer is already running
        if curl -s http://localhost:8080/geoserver/ >/dev/null 2>&1; then
            echo "GeoServer is already running on port 8080"
        else
            echo "Starting GeoServer..."
            geoserver "$GEOSERVER_DATA_DIR" &
            echo "GeoServer started in background"
        fi
        ;;
        
    "stop-geoserver")
        echo "Stopping GeoServer..."
        pkill -f "geoserver" || true
        echo "GeoServer stopped"
        ;;
        
    *)
        echo "Usage: $0 {setup|start|restart|sync|shell|check|start-geoserver|stop-geoserver}"
        echo ""
        echo "Commands:"
        echo "  setup          - Set up database for the original project"
        echo "  start          - Start the original Tools4MSP GeoMeaning project at $SITEURL"
        echo "  restart        - Kill existing server and restart with proper environment + GeoServer"
        echo "  sync           - Sync database migrations"  
        echo "  shell          - Open Django shell"
        echo "  check          - Check project configuration"
        echo "  start-geoserver - Start GeoServer only"
        echo "  stop-geoserver  - Stop GeoServer only"
        echo ""
        echo "This runs the ACTUAL Tools4MSP GeoMeaning project with full GeoNode functionality"
        echo ""
        echo "💡 Pro tip: Always use this script to start the server to ensure environment variables are loaded!"
        ;;
esac 