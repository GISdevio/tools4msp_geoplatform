#!/bin/bash

# Tools4MSP GeoMeaning - Original Project Runner
# This runs the actual project with full GeoNode functionality

echo "Starting Tools4MSP GeoMeaning Project (Original Configuration)..."

# Set environment exactly as expected by the original project
set -a
source ../.override_dev_env

# Ensure we have the correct Python path and GDAL setup
export PYTHONPATH=/Users/gius/Gisdevio/tools4msp_geoplatform/src
export GDAL_CONFIG=/opt/homebrew/bin/gdal-config
export GDAL_VERSION=3.11.3

# Use Python 3.11 (where our dependencies are installed)
PYTHON="/opt/homebrew/bin/python3.11"

echo "Environment configured for original project"
echo "Using settings: $DJANGO_SETTINGS_MODULE"

# What you want to do:
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
        
    *)
        echo "Usage: $0 {setup|start|sync|shell|check}"
        echo ""
        echo "Commands:"
        echo "  setup  - Set up database for the original project"
        echo "  start  - Start the original Tools4MSP GeoMeaning project at $SITEURL"
        echo "  sync   - Sync database migrations"  
        echo "  shell  - Open Django shell"
        echo "  check  - Check project configuration"
        echo ""
        echo "This runs the ACTUAL Tools4MSP GeoMeaning project with full GeoNode functionality"
        ;;
esac 