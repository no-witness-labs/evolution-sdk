#!/bin/bash

# Script to run all TypeScript examples and generate MDX documentation
# This ensures examples are working before generating documentation

set -e  # Exit on any error

DOCS_DIR="$(dirname "$(dirname "$0")")"
EXAMPLES_DIR="$DOCS_DIR/examples"
SCRIPTS_DIR="$DOCS_DIR/scripts"

echo "🚀 Running Evolution SDK Documentation Generator"
echo "==============================================="

# Function to run a single TypeScript file
run_example() {
    local file="$1"
    local relative_path="${file#$EXAMPLES_DIR/}"
    
    echo "📄 Running: $relative_path"
    
    # Use pnpm exec to ensure we have access to workspace dependencies
    if ! pnpm exec tsx "$file"; then
        echo "❌ Failed to run: $relative_path"
        return 1
    else
        echo "✅ Success: $relative_path"
        return 0
    fi
}

# Function to run examples in a directory
run_examples_in_dir() {
    local dir="$1"
    local failures=0
    
    if [[ -d "$dir" ]]; then
        echo ""
        echo "📁 Running examples in: ${dir#$EXAMPLES_DIR/}"
        echo "-------------------------------------------"
        
        # Find all .ts files in the directory
        while IFS= read -r -d '' file; do
            if ! run_example "$file"; then
                ((failures++))
            fi
        done < <(find "$dir" -name "*.ts" -type f -print0 | sort -z)
        
        if [[ $failures -gt 0 ]]; then
            echo "❌ $failures example(s) failed in ${dir#$EXAMPLES_DIR/}"
            return 1
        else
            echo "✅ All examples passed in ${dir#$EXAMPLES_DIR/}"
            return 0
        fi
    fi
}

# Main execution
main() {
    local total_failures=0
    
    # Change to docs directory
    cd "$DOCS_DIR"
    
    # Run individual example files in root examples directory
    if [[ -d "$EXAMPLES_DIR" ]]; then
        echo ""
        echo "📄 Running individual examples..."
        echo "--------------------------------"
        
        local found_individual=0
        while IFS= read -r -d '' file; do
            found_individual=1
            if ! run_example "$file"; then
                ((total_failures++))
            fi
        done < <(find "$EXAMPLES_DIR" -maxdepth 1 -name "*.ts" -type f -print0 | sort -z)
        
        if [[ $found_individual -eq 0 ]]; then
            echo "ℹ️  No individual examples found"
        fi
    fi
    
    # Run examples in subdirectories (like data/, address/, etc.)
    if [[ -d "$EXAMPLES_DIR" ]]; then
        local found_dirs=0
        while IFS= read -r -d '' dir; do
            found_dirs=1
            if ! run_examples_in_dir "$dir"; then
                ((total_failures++))
            fi
        done < <(find "$EXAMPLES_DIR" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)
        
        if [[ $found_dirs -eq 0 ]]; then
            echo "ℹ️  No example directories found"
        fi
    fi
    
    echo ""
    echo "📊 Test Summary"
    echo "==============="
    
    if [[ $total_failures -eq 0 ]]; then
        echo "✅ All examples ran successfully!"
        echo ""
        echo "🔄 Generating MDX documentation..."
        echo "--------------------------------"
        
        # Run the snippet generation script
        if pnpm exec tsx "scripts/generate-getting-started.ts"; then
            echo "✅ MDX documentation generated successfully!"
            echo ""
            echo "🎉 Documentation build complete!"
            echo "You can now run 'pnpm run dev' to view the documentation."
        else
            echo "❌ Failed to generate MDX documentation"
            exit 1
        fi
    else
        echo "❌ $total_failures example(s) failed"
        echo "Please fix the failing examples before generating documentation."
        exit 1
    fi
}

# Handle script interruption
trap 'echo ""; echo "⚠️  Script interrupted"; exit 130' INT

# Run main function
main "$@"
