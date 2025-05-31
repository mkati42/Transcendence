function Div( { className } ) {
  const div = document.createElement( "div" );
  if ( className ) div.className = className;
  return div;
}

function Input( { className, type, id, placeholder } ) {
  const input = document.createElement( "input" );
  if ( type ) input.type = type;
  if ( id ) input.id = id;
  if ( placeholder ) input.placeholder = placeholder;
  if ( className ) input.className = className;
  return input;
}

function Button( { id, content, className } ) {
  const button = document.createElement( "button" );
  if ( id ) button.id = id;
  if ( content ) button.textContent = content;
  if ( className ) button.className = className;
  return button;
}

function Text( { tag, content, attributes } ) {
  const text = document.createElement( tag );
  if ( content ) text.innerHTML = content;
  if ( attributes ) {
    for ( const key in attributes ) {
      text.setAttribute( key, attributes[key] );
    }
  }
  return text;
}

export { Button, Div, Input, Text };
