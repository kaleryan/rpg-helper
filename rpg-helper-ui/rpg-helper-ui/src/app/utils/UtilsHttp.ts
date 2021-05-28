export class UtilsHttp {
  public static parseQueryString(queryString: string) {
    const params = {};
    if (queryString === undefined) {
      return params;
    }
    let queries;
    let temp;
    let i;
    let l;

    // Split into key/value pairs
    queries = queryString.split('&');
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
    }
}