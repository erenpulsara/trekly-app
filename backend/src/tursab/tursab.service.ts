import { Injectable, Logger } from '@nestjs/common';

export interface TursabResult {
  verified: boolean;
  agencyName?: string;
  error?: string;
}

const FORM_URL = 'https://online.tursab.org.tr/publicpages/embedded/agencysearch/';

@Injectable()
export class TursabService {
  private readonly logger = new Logger(TursabService.name);

  async verify(belgeNo: string): Promise<TursabResult> {
    const no = belgeNo.trim();
    if (!no || !/^\d{1,6}$/.test(no)) {
      return { verified: false, error: 'invalid_input' };
    }

    try {
      const commonHeaders: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9',
        Referer: 'https://www.tursab.org.tr/acenta-arama',
      };

      // Step 1: GET page → collect session cookie + ASP.NET hidden fields
      const pageRes = await fetch(FORM_URL, { headers: commonHeaders });
      const rawCookie = pageRes.headers.get('set-cookie') ?? '';
      const cookieStr = rawCookie
        .split(',')
        .map((c) => c.split(';')[0].trim())
        .filter(Boolean)
        .join('; ');
      const pageHtml = await pageRes.text();

      const viewstate = pageHtml.match(
        /name="__VIEWSTATE" id="__VIEWSTATE" value="([^"]+)"/,
      )?.[1] ?? '';
      const viewstateGen = pageHtml.match(
        /name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="([^"]+)"/,
      )?.[1] ?? '';
      const eventValidation = pageHtml.match(
        /name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="([^"]+)"/,
      )?.[1] ?? '';

      if (!viewstate) {
        this.logger.warn('TURSAB: Could not extract VIEWSTATE from page');
        return { verified: false, error: 'connection_failed' };
      }

      // Step 2: POST the search form with Belge No
      const params = new URLSearchParams();
      params.set('RadScriptManager_TSM', '');
      params.set('__EVENTTARGET', '');
      params.set('__EVENTARGUMENT', '');
      params.set('__LASTFOCUS', '');
      params.set('__VIEWSTATE', viewstate);
      params.set('__VIEWSTATEGENERATOR', viewstateGen);
      params.set('__EVENTVALIDATION', eventValidation);
      params.set('ctl00$ContentPlaceHolder1$OprGroup', 'NameSearchRadio');
      params.set('ctl00$ContentPlaceHolder1$TursabNo$AutoCompleteTextBox', '');
      params.set('ctl00$ContentPlaceHolder1$TursabNo$AutoCompleteTextBoxHF', '');
      params.set('ctl00$ContentPlaceHolder1$TursabNo$AutoCompleteTextBoxTF', '');
      params.set('ctl00$ContentPlaceHolder1$TursabNoText', no);
      params.set('ctl00$ContentPlaceHolder1$SearchButton', 'ARA');

      const searchRes = await fetch(FORM_URL, {
        method: 'POST',
        headers: {
          ...commonHeaders,
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: cookieStr,
          Origin: 'https://online.tursab.org.tr',
        },
        body: params.toString(),
      });

      const html = await searchRes.text();
      return this.parseResult(html);
    } catch (err) {
      this.logger.warn(`TURSAB verify error: ${err}`);
      return { verified: false, error: 'connection_failed' };
    }
  }

  private parseResult(html: string): TursabResult {
    // Result pattern: <span>Seyahat Acentası Adı : </span>MİKA TURİZM
    const nameMatch = html.match(
      /Seyahat Acentas[ıi] Ad[ıi]\s*:\s*<\/span>([^<]+)/i,
    );
    if (nameMatch) {
      return { verified: true, agencyName: nameMatch[1].trim() };
    }

    // Fallback: check for lit-container with agency data
    if (html.includes('lit-container') && html.includes('Seyahat Acentas')) {
      return { verified: true };
    }

    return { verified: false };
  }
}
