function changeText(currentIdentifier, newIdentifier) {
    if (currentIdentifier === newIdentifier) {
        return;
    }
    collapseDeselect(currentIdentifier);
    expandSelect(newIdentifier);
}

function collapseDeselect(currentIdentifier) {
    $('#' + currentIdentifier + '-selector').removeClass('selected');
    $('#' + currentIdentifier + '-selector').addClass('unselected');
    $('#' + currentIdentifier + '-selector-tablet').removeClass('selected');
    $('#' + currentIdentifier + '-selector-tablet').addClass('unselected');
    $('#' + currentIdentifier).css('display', 'none');
}

function expandSelect(currentIdentifier) {
    $('#' + currentIdentifier + '-selector').removeClass('unselected');
    $('#' + currentIdentifier + '-selector').addClass('selected');
    $('#' + currentIdentifier + '-selector-tablet').removeClass('unselected');
    $('#' + currentIdentifier + '-selector-tablet').addClass('selected');
    $('#' + currentIdentifier).css('display', 'block');
}