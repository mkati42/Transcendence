export const EventSystem = {

  listeners: {},

  on( event, listener ) {
    if ( !this.listeners[event] ) this.listeners[event] = [];
    this.listeners[event].push( listener );
  },

  emit( event, data ) {
    ( this.listeners[event] || [] ).forEach( listener => listener( data ) );
  }
}

export const Events = {
  SERVER_UPDATE: 1,
  GAME_START: 2,
  LOGIN: 3,
  LOGOUT: 4,
}