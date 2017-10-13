const currentSection = (state = {}, action) => {
    switch (action.type) {
      case 'CHANGE_CURRENT_SECTION':
        return Object.assign({}, state, action.obj);
      case 'CHANGE_CURRENT_OPTION':
        return Object.assign({}, state, action.optionObj);
      default:
        return state;
    }
  }
  
  export default currentSection;