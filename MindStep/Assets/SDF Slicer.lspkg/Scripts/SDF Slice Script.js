// -----JS CODE-----
// @input SceneObject sdfObject {"label":"SDF Object"}
// @input SceneObject sliceObject {"label":"Slice Object"}

// @input bool PrintSlicePosition
// @input Component.Text textOutput {"showIf":"PrintSlicePosition"}


if (!validateInputs()) { 
    return;
}

var renderMesh = script.sdfObject.getComponent("Component.RenderMeshVisual").mesh;
var objectMat = script.sdfObject.getComponent("Component.RenderMeshVisual").mainMaterial;
var sliceMat = script.sliceObject.getComponent("Component.RenderMeshVisual").mainMaterial

var sdfaabbMax = renderMesh.aabbMax;
var sdfaabbMin = renderMesh.aabbMin;
var sdfBboxSize = sdfaabbMax.sub(sdfaabbMin);

var sliceMesh = script.sliceObject.getFirstComponent("Component.RenderMeshVisual").mesh
var sliceMeshaabbMax = sliceMesh.aabbMax;
var sliceMeshaabbMin = sliceMesh.aabbMin;
var sliceScale = sliceMeshaabbMax.sub(sliceMeshaabbMin);

// Set UV to clamp mode so when scaling the coordinates the texture it will not repeat.
sliceMat.mainPass.samplers.sdfTex.wrapU = WrapMode.ClampToBorder;
sliceMat.mainPass.samplers.sdfTex.wrapV = WrapMode.ClampToBorder;


var touchMove = function(eventData) {
    var sliceObjPos = script.sliceObject.getTransform().getLocalPosition();
    var touchedPos = eventData.getTouchPosition();
    sliceObjPos.z = 1.0 - clamp(touchedPos.x, 0.0, 1.0);
    sliceObjPos.z = remap(sliceObjPos.z, 0.0, 1.0, sdfaabbMin.z, sdfaabbMax.z);
    script.sliceObject.getTransform().setLocalPosition(sliceObjPos);
}
script.createEvent("TouchMoveEvent").bind(touchMove);


var update = function() {
    var sdfScale = script.sdfObject.getTransform().getWorldScale();
    var aabbCenter = getCenter(sdfaabbMin, sdfaabbMax, sdfScale);

    // Scale the slice plane according to original object bbox size
    var sdfBboxScaled = sdfBboxSize.mult(sdfScale);
    var newSliceScale = sdfBboxScaled.div(sliceScale);
    
    // Remap the slice object's Z position into a 0-1 value for scanning the SDF texture
    var sliceObjPos = script.sliceObject.getTransform().getLocalPosition();
    var sliceZ = sliceObjPos.z * sdfScale.z;
    var sdfSlice = remap(sliceZ, sdfaabbMin.mult(sdfScale).z, sdfaabbMax.mult(sdfScale).z, 0.0, 1.0);
    sdfSlice = 1.0 - clamp(sdfSlice, 0.0, 1.0);    

    // Update materials
    objectMat.mainPass.sliceOffset = sdfSlice;    
    sliceMat.mainPass.sliceOffset = sdfSlice;
    if (script.PrintSlicePosition) script.textOutput.text = "Slice Position: " + sdfSlice.toFixed(2)

    // Set slice X and Z position to target object's center
    // Set slice scale to be relative to target object's bounding box
    sliceObjPos.x = aabbCenter.x/sdfScale.x;
    sliceObjPos.y = aabbCenter.y/sdfScale.y;
    script.sliceObject.getTransform().setLocalPosition(sliceObjPos);
    script.sliceObject.getTransform().setLocalScale(new vec3(newSliceScale.x, newSliceScale.y, 0.0).div(sdfScale) );
    
}
script.createEvent("UpdateEvent").bind(update);



function validateInputs() {

    if (!script.sdfObject) {
        print("ERROR: Make sure SDF Object is set.");
        return false;
    }
    if (!script.sdfObject.getComponent("Component.RenderMeshVisual")) {
        print("ERROR: Make sure the SDF Object has a Render Mesh Visual component.")
        return false;
    }
    if (!script.sdfObject.getComponent("Component.RenderMeshVisual").mesh) {
        print("ERROR: Make sure the SDF Object has a mesh assigned.")
        return false;
    }
    if (!script.sdfObject.getComponent("Component.RenderMeshVisual").mainMaterial) {
        print("ERROR: Make sure the SDF Object has the Slice Material assigned to its Render Mesh Visual component.")
        return false;
    }
    if (!script.sliceObject) {
        print("ERROR: Make sure Slice Object is set");
        return false;
    }
    if (!script.sliceObject.getComponent("Component.RenderMeshVisual") ||
        !script.sliceObject.getComponent("Component.RenderMeshVisual").mesh) {
        print("ERROR: Make sure Slice Object has a Render Mesh Visual component with a Plane mesh assigned");
        return false;
    }    
    if (!script.sliceObject.getComponent("Component.RenderMeshVisual").mainMaterial) {
        print("ERROR: Make sure Slice Material is assigned to the Slice Object's Render Mesh Visual component.");
        return false;
    }
    if (script.PrintSlicePosition && !script.textOutput) {
        print("ERROR: Make sure a text component is assigned to Text Output.")
        return false;
    }
    
    return true;
}

function getCenter( min, max, scale ) {
    return min.add(max).uniformScale(0.5).mult(scale);
}

function clamp(val, min, max ) {
	return Math.max( min, Math.min( max, val ) );
}

function lerp( a, b, t ){
    return a * ( 1.0 - t ) + b * t;
}

function lerpVec3( a, b, t ){
    return new vec3( lerp( a.x, b.x, t ), lerp( a.y, b.y, t ), lerp( a.z, b.z, t ) );
}

function remap (value, oldmin, oldmax, newmin, newmax) { 
    return newmin + (value - oldmin) * (newmax - newmin) / (oldmax - oldmin); 
}

function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max);
}