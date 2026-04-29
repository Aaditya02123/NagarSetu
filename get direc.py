import os

def print_tree(startpath, ignore_folders):
    for root, dirs, files in os.walk(startpath):
        # Filter directories in-place to skip ignored ones
        dirs[:] = [d for d in dirs if d not in ignore_folders]
        
        # Calculate indentation level
        level = root.replace(startpath, '').count(os.sep)
        indent = '│   ' * level
        
        # Print the current directory name
        if root == startpath:
            print(f"ROOT: {os.path.basename(root)}/")
        else:
            print(f"{indent}├── {os.path.basename(root)}/")
        
        # Print the files within this directory
        sub_indent = '│   ' * (level + 1)
        for i, f in enumerate(files):
            marker = "└── " if i == len(files) - 1 and not dirs else "├── "
            print(f"{sub_indent}{marker}{f}")

if __name__ == "__main__":
    # 1. Get current working directory
    current_dir = os.getcwd()
    
    # 2. Define what to stay away from
    to_ignore = {'__pycache__', 'node_modules', '.git', 'venv', '.env', '.idea', '.vscode'}
    
    # 3. Automatically find all folders in the current directory
    # (Excluding the ones in our ignore list)
    folders_in_dir = [
        d for d in os.listdir(current_dir) 
        if os.path.isdir(os.path.join(current_dir, d)) and d not in to_ignore
    ]

    print(f"Project Structure for: {current_dir}\n")

    if not folders_in_dir:
        print("No subdirectories found (excluding ignored folders).")
    else:
        for folder in folders_in_dir:
            folder_path = os.path.join(current_dir, folder)
            print(f"\n[ Scanning Folder: {folder} ]")
            print_tree(folder_path, to_ignore)
            print("─" * 30)
