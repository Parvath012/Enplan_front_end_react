# React Flow + Dagre Integration

## Overview
This project has been updated to use **React Flow + Dagre** for automatic hierarchy diagram layout instead of manual positioning.

## What Was Changed

### 1. **Replaced Manual Diagram Logic**
- ❌ Removed complex manual positioning calculations
- ❌ Removed manual arrow drawing and bus line logic
- ✅ Added React Flow for automatic node positioning
- ✅ Added Dagre for automatic layout algorithms

### 2. **New Files Created**
- `src/utils/graphUtils.ts` - Data processing and layout utilities
- `src/components/CustomNode.tsx` - Custom node styling
- `src/data/entities.json` - Sample data structure

### 3. **Updated Files**
- `src/components/structure/EntityStructurePanel.tsx` - Now uses React Flow

## Features

### ✅ **Automatic Layout**
- **Left-to-right tree structure** using Dagre
- **Automatic positioning** of all nodes
- **Proper spacing** between nodes and levels

### ✅ **Custom Node Styling**
- **Blue borders** for Rollup entities
- **Purple borders** for Planning entities
- **Rounded corners** and shadows
- **RO/PL icons** based on entity type

### ✅ **Clean Connections**
- **Straight edges** connecting parent → child
- **Automatic routing** around nodes
- **Consistent styling** (#C4C7C5 color)

### ✅ **Interactive Features**
- **Zoom controls** (25% to 200%)
- **Pan and zoom** with mouse/touch
- **Mini-map** for navigation
- **Controls** for reset/fit view

## Data Structure

Your JSON should follow this format:
```json
{
  "id": 1,
  "displayName": "Entity Name",
  "entityType": "Rollup Entity", // or "Planning Entity"
  "parent": [
    {
      "id": 2,
      "displayName": "Parent Entity",
      "entityType": "Rollup Entity"
    }
  ]
}
```

## How It Works

### 1. **Data Processing** (`graphUtils.ts`)
- Converts your JSON to React Flow nodes/edges
- Handles parent-child relationships
- Applies entity type styling

### 2. **Layout Engine** (Dagre)
- Automatically positions nodes
- Creates left-to-right hierarchy
- Maintains proper spacing

### 3. **Rendering** (React Flow)
- Renders nodes with custom styling
- Draws connections between entities
- Handles user interactions

## Usage

### **Start the Project**
```bash
npm start
```

### **View the Diagram**
- Open the Entity Structure panel
- See automatic layout in action
- Use zoom controls to adjust view
- Pan around the diagram

### **Customize Styling**
- Modify `CustomNode.tsx` for node appearance
- Adjust colors in `graphUtils.ts`
- Change layout parameters in `getLayoutedElements()`

## Benefits

1. **🚀 Automatic Layout** - No more manual positioning
2. **🎨 Professional Appearance** - Clean, modern design
3. **📱 Responsive** - Works on all screen sizes
4. **🔧 Maintainable** - Clean, TypeScript-friendly code
5. **⚡ Performance** - Optimized rendering and interactions

## Troubleshooting

### **If nodes don't appear:**
- Check console for data processing logs
- Verify JSON structure matches expected format
- Ensure all required fields are present

### **If layout looks wrong:**
- Check `rankdir` parameter in `getLayoutedElements()`
- Adjust `nodesep` and `ranksep` values
- Verify parent-child relationships

### **If styling is incorrect:**
- Check entity type strings in your data
- Verify color definitions in `getEntityColors()`
- Ensure CustomNode is properly imported

## Next Steps

1. **Test with your real data** - Replace sample data
2. **Customize styling** - Adjust colors, fonts, sizes
3. **Add interactions** - Click handlers, tooltips
4. **Optimize performance** - For large hierarchies

## Dependencies

- `reactflow` - Diagram rendering and interactions
- `dagre` - Automatic layout algorithms
- `@mui/material` - UI components and styling
- `@carbon/icons-react` - Icons

All dependencies are automatically installed when you run the project.

