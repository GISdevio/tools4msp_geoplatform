#!/bin/bash

# Tools4MSP GeoMeaning Project Aliases
# Add these aliases to your shell profile for easy access

echo "Setting up Tools4MSP aliases..."

# Define the project directory
T4MSP_DIR="/Users/gius/Gisdevio/tools4msp_geoplatform"

# Create aliases
cat << 'EOF' >> ~/.zshrc

# Tools4MSP GeoMeaning Project Aliases
alias t4msp-start="cd /Users/gius/Gisdevio/tools4msp_geoplatform/src && ./run_original_project.sh start"
alias t4msp-restart="cd /Users/gius/Gisdevio/tools4msp_geoplatform/src && ./run_original_project.sh restart"
alias t4msp-shell="cd /Users/gius/Gisdevio/tools4msp_geoplatform/src && ./run_original_project.sh shell"
alias t4msp-check="cd /Users/gius/Gisdevio/tools4msp_geoplatform/src && ./run_original_project.sh check"
alias t4msp-sync="cd /Users/gius/Gisdevio/tools4msp_geoplatform/src && ./run_original_project.sh sync"
alias t4msp-geoserver="cd /Users/gius/Gisdevio/tools4msp_geoplatform/src && ./run_original_project.sh start-geoserver"
alias t4msp-stop-geoserver="cd /Users/gius/Gisdevio/tools4msp_geoplatform/src && ./run_original_project.sh stop-geoserver"
alias t4msp="cd /Users/gius/Gisdevio/tools4msp_geoplatform"

EOF

echo ""
echo "✅ Aliases added to ~/.zshrc"
echo ""
echo "🔄 Reload your shell or run: source ~/.zshrc"
echo ""
echo "📝 Available commands:"
echo "  t4msp-start   - Start the project with proper environment"
echo "  t4msp-restart - Kill existing server and restart"
echo "  t4msp-shell   - Open Django shell"
echo "  t4msp-check   - Check project configuration"
echo "  t4msp-sync    - Sync database migrations"
echo "  t4msp         - Navigate to project directory"
echo ""
echo "💡 These commands will ALWAYS load the environment variables properly!"
