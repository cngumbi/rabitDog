const ParseRequestUrl = ()=>{
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

export default ParseRequestUrl;