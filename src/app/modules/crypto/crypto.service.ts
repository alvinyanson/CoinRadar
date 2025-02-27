import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export const SUPPORTED_CURRENCIES = [
    'btc',
    'eth',
    'ltc',
    'bch',
    'bnb',
    'eos',
    'xrp',
    'xlm',
    'link',
    'dot',
    'yfi',
    'usd',
    'aed',
    'ars',
    'aud',
    'bdt',
    'bhd',
    'bmd',
    'brl',
    'cad',
    'chf',
    'clp',
    'cny',
    'czk',
    'dkk',
    'eur',
    'gbp',
    'gel',
    'hkd',
    'huf',
    'idr',
    'ils',
    'inr',
    'jpy',
    'krw',
    'kwd',
    'lkr',
    'mmk',
    'mxn',
    'myr',
    'ngn',
    'nok',
    'nzd',
    'php',
    'pkr',
    'pln',
    'rub',
    'sar',
    'sek',
    'sgd',
    'thb',
    'try',
    'twd',
    'uah',
    'vef',
    'vnd',
    'zar',
    'xdr',
    'xag',
    'xau',
    'bits',
    'sats',
];

@Injectable({ providedIn: 'root' })
export class CryptoService {
    private baseURL = 'https://api.coingecko.com/api/v3';
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _supportedCurrencies: BehaviorSubject<string[]> =
        new BehaviorSubject(SUPPORTED_CURRENCIES);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    get supportedCurrencies$(): Observable<any> {
        return this._supportedCurrencies.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/crypto').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    getTrendingCurrencies(currency: string): Observable<any> {
        return this._httpClient.get(
            `${this.baseURL}/coins/markets?vs_currency=${currency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
        );
    }

    getGraphicalCurrency(coinId: string): Observable<any> {
        return this._httpClient.get(
            `${this.baseURL}/coins/${coinId}/market_chart?vs_currency=USD&days=10`
        );
    }
}
