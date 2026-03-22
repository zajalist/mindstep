global.touchSystem.touchBlocking =true;

//@ui {"label": "<h2><center> position (X) </center></h2>"}
//@ui {"label": "<center>Horizontal movement between three positions</center>"}
//@ui {"label": "<center> (left, center, right) with a jump effect</center>"}
//@ui {"label": " "}
// @input SceneObject targetObject
// @input float positionLeftX = -5.0
// @input float positionCenterX = 0.0
// @input float positionRightX = 5.0
// @input float horizontalTransitionDuration = 0.5

// @input float horizontalJumpHeight = 2.0
//@ui {"label": " "}
//@ui {"label": "<h2><center> Jump (Y) </center></h2>"}
//@ui {"label": "<center>Vertical jumping motion when pulling up</center>"}
//@ui {"label": " "}
// @input float verticalJumpHeight = 2.0
// @input float verticalJumpDuration = 0.5



var touchStartPosition = new vec2(0, 0);
var currentPosition = 1; 
var targetPosition = new vec3(0, 0, 0);
var startPosition = new vec3(0, 0, 0);
var isMovingHorizontal = false;
var lastDragDirection = 0;
var horizontalTransitionTime = 0;


var isJumpingVertical = false;
var verticalJumpTime = 0;


var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(onTouchStart);

var touchEndEvent = script.createEvent("TouchEndEvent");
touchEndEvent.bind(onTouchEnd);

function onTouchStart(eventData) {
    if (!isMovingHorizontal && !isJumpingVertical) {
        touchStartPosition = eventData.getTouchPosition();
        startPosition = script.targetObject.getTransform().getWorldPosition();
    }
}

function onTouchEnd(eventData) {
    if (isMovingHorizontal || isJumpingVertical) return;

    var touchEndPosition = eventData.getTouchPosition();
    var touchDelta = touchEndPosition.sub(touchStartPosition);

    
    if (Math.abs(touchDelta.x) > Math.abs(touchDelta.y)) {
        
        handleHorizontalDrag(touchDelta);
    } else if (touchDelta.y < -0.1) {
        
        startVerticalJump();
    }
}

function handleHorizontalDrag(touchDelta) {
    if (touchDelta.x > 0) {
        
        if (currentPosition === 1) {
            currentPosition = 2;
        } else if (currentPosition === 0 || currentPosition === 2) {
            currentPosition = lastDragDirection === 1 ? 2 : 1;
        }
        lastDragDirection = 1;
    } else {
        
        if (currentPosition === 1) {
            currentPosition = 0;
        } else if (currentPosition === 0 || currentPosition === 2) {
            currentPosition = lastDragDirection === -1 ? 0 : 1;
        }
        lastDragDirection = -1;
    }

    
    targetPosition = script.targetObject.getTransform().getWorldPosition();
    targetPosition.x = currentPosition === 0 ? script.positionLeftX :
                      currentPosition === 1 ? script.positionCenterX :
                      script.positionRightX;

    
    startPosition = script.targetObject.getTransform().getWorldPosition();
    horizontalTransitionTime = 0;
    isMovingHorizontal = true;
}

function startVerticalJump() {
    verticalJumpTime = 0;
    isJumpingVertical = true;
}

function updateMovement(eventData) {
    if (isMovingHorizontal) {
        updateHorizontalMovement();
    }
    
    if (isJumpingVertical) {
        updateVerticalJump();
    }
}

function updateHorizontalMovement() {
    horizontalTransitionTime += getDeltaTime();
    var t = horizontalTransitionTime / script.horizontalTransitionDuration;

    if (t >= 1) {
        t = 1;
        isMovingHorizontal = false;
    }

    
    var horizontalJumpY = script.horizontalJumpHeight * Math.sin(t * Math.PI);
    var newPosition = vec3.lerp(startPosition, targetPosition, t);
    newPosition.y += horizontalJumpY;
    
    script.targetObject.getTransform().setWorldPosition(newPosition);
}

function updateVerticalJump() {
    verticalJumpTime += getDeltaTime();
    var t = verticalJumpTime / script.verticalJumpDuration;

    if (t >= 1) {
        t = 1;
        isJumpingVertical = false;
    }

    
    var jumpY = script.verticalJumpHeight * Math.sin(t * Math.PI);
    var currentPos = script.targetObject.getTransform().getWorldPosition();
    var newPosition = new vec3(currentPos.x, startPosition.y + jumpY, currentPos.z);
    
    script.targetObject.getTransform().setWorldPosition(newPosition);
}


var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(updateMovement);


var initEvent = script.createEvent("TurnOnEvent");
initEvent.bind(function() {
    if (script.targetObject) {
        print("CombinedDragAndJump script initialized");
        targetPosition = script.targetObject.getTransform().getWorldPosition();
        startPosition = targetPosition;
    } else {
        print("Error: targetObject not specified or found.");
    }
});