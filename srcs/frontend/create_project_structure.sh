#!/bin/bash

# Define project directories
PROJECT_DIR="threejs-game"
SRC_DIR="$PROJECT_DIR/src"
PUBLIC_DIR="$PROJECT_DIR/public"
DIST_DIR="$PROJECT_DIR/dist"
SHADERS_DIR="$SRC_DIR/shaders"
SHADERS_VERTEX_DIR="$SHADERS_DIR/vertex"
SHADERS_FRAGMENT_DIR="$SHADERS_DIR/fragment"
PHYSICS_DIR="$SRC_DIR/physics"
POSTPROCESSING_DIR="$SRC_DIR/postprocessing"
POSTPROCESSING_EFFECTS_DIR="$POSTPROCESSING_DIR/effects"
UI_DIR="$SRC_DIR/ui"
ENTITIES_DIR="$SRC_DIR/entities"
SYSTEMS_DIR="$SRC_DIR/systems"

# Create directories
mkdir -p $PROJECT_DIR
mkdir -p $SRC_DIR
mkdir -p $PUBLIC_DIR/assets/{textures,models,audio}
mkdir -p $DIST_DIR
mkdir -p $SHADERS_VERTEX_DIR
mkdir -p $SHADERS_FRAGMENT_DIR
mkdir -p $PHYSICS_DIR
mkdir -p $POSTPROCESSING_EFFECTS_DIR
mkdir -p $UI_DIR
mkdir -p $ENTITIES_DIR
mkdir -p $SYSTEMS_DIR

# Create key files
echo "// Entry point for the application" > $SRC_DIR/main.ts
echo "// Game initialization and main loop" > $SRC_DIR/core/Game.ts
echo "// WebGL renderer and CSS renderer setup" > $SRC_DIR/core/Renderer.ts
echo "// Scene creation and management" > $SRC_DIR/core/Scene.ts
echo "// Camera setup and control" > $SRC_DIR/core/Camera.ts
echo "// Asset loaders for textures, models, etc." > $SRC_DIR/core/Loader.ts
echo "// Helper to load and compile shaders" > $SHADERS_DIR/ShaderLoader.ts
echo "// Custom or wrapper for physics engine" > $PHYSICS_DIR/PhysicsEngine.ts
echo "// Custom post-processing composer" > $POSTPROCESSING_DIR/EffectComposer.ts
echo "// Example custom effect" > $POSTPROCESSING_EFFECTS_DIR/CustomEffect.ts
echo "// Heads-up display (e.g., score, health)" > $UI_DIR/HUD.ts
echo "// Game menu UI" > $UI_DIR/Menu.ts
echo "// Player character" > $ENTITIES_DIR/Player.ts
echo "// Enemy characters" > $ENTITIES_DIR/Enemy.ts
echo "// Non-player characters" > $ENTITIES_DIR/NPC.ts
echo "// Power-up entities" > $ENTITIES_DIR/PowerUp.ts
echo "// Input handling (keyboard, mouse, etc.)" > $SYSTEMS_DIR/InputSystem.ts
echo "// Collision detection and handling" > $SYSTEMS_DIR/CollisionSystem.ts
echo "// Animation handling" > $SYSTEMS_DIR/AnimationSystem.ts
echo "// Game state management" > $SYSTEMS_DIR/GameState.ts

# Create public files
echo '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three.js Game</title>
</head>
<body>
  <script type="module" src="../src/main.ts"></script>
</body>
</html>' > $PUBLIC_DIR/index.html

# Create shaders
echo "// Basic vertex shader" > $SHADERS_VERTEX_DIR/basic.vert.glsl
echo "// Basic fragment shader" > $SHADERS_FRAGMENT_DIR/basic.frag.glsl

# Create README file
echo '# Three.js Game Project' > $PROJECT_DIR/README.md

# Success message
echo "Project structure created successfully in $PROJECT_DIR."
