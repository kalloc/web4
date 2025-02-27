
import { context, ContractPromise, ContractPromiseBatch, logging, storage, u128, util } from 'near-sdk-as'

@nearBindgen
class Web4Request {
    accountId: string | null;
    path: string;
    params: Map<string, string>;
    query: Map<string, Array<string>>;
    preloads: Map<string, Web4Response>;
}

@nearBindgen
class Web4Response {
    contentType: string;
    status: u32;
    body: Uint8Array;
    bodyUrl: string;
    preloadUrls: string[] = [];
}

class HtmlAttributes {
    id: string | null;
    name: string | null;
    class: string | null;
    style: string | null;

    toString(): string {
        let result = "";
        if (this.id) {
            result += "id=";
            result += this.id!;
        }
        if (this.name) {
            result += "name=";
            result += this.name!;
        }
        if (this.class) {
            result += "class=";
            result += this.class!;
        }
        if (this.style) {
            result += "style=";
            result += this.style!;
        }
        return result;
    }
}

class HtmlFormAttributes extends HtmlAttributes {
    action: string | null;
    method: string = "POST";

    toString(): string {
        let result = super.toString();
        if (this.action) {
            result += "action=";
            result += this.action!;
        }
        if (this.method) {
            result += "method=";
            result += this.method;
        }
        return result;
    }
}

function form(attrs: HtmlFormAttributes, content: string[] | null = null): string {
    return '<form ' + attrs.toString() + '>' + (content ? content.join('\n') : '') + '</form>';
}

function textarea(attrs: HtmlAttributes, content: string[] | null = null): string {
    return '<textarea ' + attrs.toString() + '>' + (content ? content.join('\n') : '') + '</textarea>';
}

function button(attrs: HtmlAttributes, content: string[] | null = null): string {
    return '<button ' + attrs.toString() + '>' + (content ? content.join('\n') : '') + '</button>';
}

function htmlResponse(text: string): Web4Response {
    return { contentType: 'text/html; charset=UTF-8', body: util.stringToBytes(text) };
}

function preloadUrls(urls: string[]): Web4Response {
    return { preloadUrls: urls };
}

function bodyUrl(url: string): Web4Response {
    return { bodyUrl: url };
}

function status(status: u32): Web4Response {
    return { status };
}
export function web4_get(request: Web4Request): Web4Response {
    if (request.path == '/test') {
        // Render HTML with form to submit a message
        return htmlResponse(form({ action: "/web4/contract/guest-book.testnet/addMessage" }, [
            textarea({ name: "text" }),
            button({ name: "submit" }, ["Post"])
        ]));
    }

    if (request.path == '/messages') {
        const getMessagesUrl = '/web4/contract/guest-book.testnet/getMessages';
        // Request preload of dependency URLs
        if (!request.preloads) {
            return preloadUrls([getMessagesUrl]);
        }

        // Render HTML with messages
        return htmlResponse('messages: ' + util.bytesToString(request.preloads.get(getMessagesUrl).body)!);
    }

    if (request.accountId) {
        // User is logged in, we can welcome them
        return htmlResponse('Hello to <b>' +  request.accountId! + '</b> from <code>' + request.path + '</code>');
    }

    // Demonstrate serving content from IPFS
    if (request.path == "/") {
        return bodyUrl('ipfs://bafybeiczcmmagwt443rpp4na4zcz6ohsrly42fdptbwthxj4ta222spffu/')
    }

    // By default return 404 Not Found
    return status(404);
}