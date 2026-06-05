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
        id: rqst[2],
        verb: rqst[3],
        query

    };
};

export default ParseRequestUrl;