/* global Office */

// Initialize Office Add-in commands
Office.onReady(() => {
    console.log('Email Marketing Add-in commands loaded');
});

/**
 * Shows the task pane
 * @param event Office event object
 */
function showTaskpane(event) {
    // The task pane will be shown automatically when the button is clicked
    // This function is called by the Office ribbon button
    event.completed();
}

// Register functions for Office commands
if (typeof Office !== 'undefined') {
    Office.actions.associate('showTaskpane', showTaskpane);
}

