//The parseUrl.js
/*
Converst URL into structured object

Eg.
#/products/edit/5?page=2

Output:
{
    resource:"products",
    verb:"edit",
    id: "5"
    query: {page: "2"}
}

*/
const ParseRequestUrl = () => {
    //Get everything after "#"
    const hash = window.location.hash.slice(1).toLowerCase() || '/';

    //Split into path and query
    const [path, queryString] = hash.split('?');

    //Break path into segments
    const rqst = path.split('/');   //rqst=parts

    //Prepare query object
    const query = {};

    if(queryString){
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            query[key] = value;
        });
    }

    return {
        resource: rqst[1],
        verb: rqst[2],
        id: rqst[3],
        query

    };
};

export default ParseRequestUrl;

//console.log("HASH:", window.location.hash);
//console.log("PARSED:", {
//  resource: parts[1],
//  verb: parts[2],
//  id: parts[3]
//});


/*const ParseRequestUrl = () => {
    const fullHash = window.location.hash.slice(1).toLowerCase() || '/';

    // Split URL and query string
    const [pathPart, queryString] = fullHash.split('?');

    // Clean segments
    const segments = pathPart.split('/').filter(segment => segment !== '');

    // Parse query params into an object
    const query = {};
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            query[key] = value;
        });
    }

    return {
        resource: segments[0] || null,
        id: segments[1] && !isNaN(segments[1]) ? segments[1] : null,
        verb: segments[2] || null,

        // Extra flexibility (like your second version)
        path: segments.slice(1),
        segments: segments,

        // Query support (like your first version, but improved)
        query: query,
    };
};

export default ParseRequestUrl;
*/
/*const ParseRequestUrl = ()=>{
  const address = document.location.hash.slice(1).split('?')[0];
  const queryString = document.location.hash.slice(1).split('?').length === 2 ? document.location.hash.slice(1).split('?')[1]: '';
  const url = address.toLowerCase();
  const rqst = url.split('/');
  const qry = queryString.split('=');
  return{
      resource: rqst[1],
      id: rqst[2],
      verb: rqst[3],
      name: qry[0],
      value: qry[1],
  };
};

export default ParseRequestUrl;*/