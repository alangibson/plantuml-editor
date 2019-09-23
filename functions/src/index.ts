import * as http from 'http';
import { URL } from 'url';
import * as querystring from 'querystring';
import * as functions from 'firebase-functions';

function extractEncodedUMLFromURL (url) {
    const path = new URL(url).pathname;
    const parts = path.split('.')[0].split('/');
    return parts[parts.length - 1];
}

function extractEncodedUML (escapedUrl: string, encodedUML: string): string {
    if ( encodedUML )
        return encodedUML;
    // Parse encoded uml from url
    // const path = new URL(querystring.unescape(escapedUrl)).pathname;
    // const parts = path.split('.')[0].split('/');
    // return parts[parts.length - 1];
    return extractEncodedUMLFromURL(querystring.unescape(escapedUrl));
}

/**
 * Return PlantUML image wrapped as a simple Confluence static macro.
 */
export const confluenceStaticMacro = functions.https.onRequest((request, response) => {
    const imageType = request.query['imageType']; // Required
    const escapedUrl = request.query['url']; // Required
    const encodedUML = request.query['encodedUML']; // Optional
    const encoded = extractEncodedUML(escapedUrl, encodedUML);
    let contentLanguage = request.query['language']; // Optional. Usually 'plantuml'
    if (! contentLanguage) {
        contentLanguage = 'plantuml';
    }

    // TODO dont hard code plantuml server. refer to confluenceImagePlaceholder instead
    response.send(`<ac:image><ri:url ri:value="http://142.93.20.106/${imageType}/${encoded}" /></ac:image>`);
    // response.send(`<ac:image><ri:url ri:value="/confluence/image-placeholder?imageType=${imageType}&encodedUML=${encoded}&language=${contentLanguage}" /></ac:image>`);
    
});

/**
 * Proxy requests from Confluence for imagePlaceholder to PlantUML rendering server.
 */
export const confluenceImagePlaceholder = functions.https.onRequest((request, response) => {

    const imageType = request.query['imageType']; // Required
    const escapedUrl = request.query['url']; // Required
    const encodedUML = request.query['encodedUML']; // Optional
    const contentLanguage = request.query['language']; // Optional. Usually 'plantuml'
    const encoded = extractEncodedUML(escapedUrl, encodedUML);

    const proxy = http.request(
        {
            hostname: '142.93.20.106',
            port: 80,
            path: `/${imageType}/${encoded}`,
            method: 'GET'
        },
        res => {
            response.writeHead(res.statusCode, res.headers);
            res.pipe(response, { end: true });
        });
    
    request.pipe(proxy, { end: true });
});
