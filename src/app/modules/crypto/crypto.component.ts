import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    CurrencyPipe,
    DecimalPipe,
    NgClass,
    NgFor,
    NgIf,
    UpperCasePipe,
} from '@angular/common';
import { ApexOptions, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { CryptoService } from './crypto.service';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { DateTime } from 'luxon';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
    selector: 'crypto',
    templateUrl: './crypto.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        NgFor,
        MatIconModule,
        NgClass,
        NgApexchartsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        NgIf,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        UpperCasePipe,
        DecimalPipe,
        CurrencyPipe,
    ],
})
export class CryptoComponent implements OnInit, OnDestroy {
    selectedCurrency = 'usd';
    selectedCoin = { name: 'Bitcoin', symbol: 'btc' };
    trendingCurrencies: any[] = [];
    graphicalData: any;
    supportedCurrencies = [
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

    @ViewChild('btcChartComponent') btcChartComponent: ChartComponent;
    appConfig: any;
    btcOptions: ApexOptions = {};
    data: any;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    watchlistChartOptions: ApexOptions = {};
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _cryptoService: CryptoService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened if 'lg' breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.getTrendingCurrencies();

        this.getGraphicalCurrency();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // BTC
        this.btcOptions = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                width: '100%',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#5A67D8'],
            dataLabels: {
                enabled: false,
            },
            grid: {
                borderColor: 'var(--fuse-border)',
                position: 'back',
                show: true,
                strokeDashArray: 6,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            legend: {
                show: false,
            },
            // series: this.data.btc.price.series,
            series: this.graphicalData,
            stroke: {
                width: 2,
                curve: 'straight',
            },
            tooltip: {
                shared: true,
                theme: 'dark',
                y: {
                    formatter: (value: number): string =>
                        '$' + value.toFixed(2),
                },
            },
            xaxis: {
                type: 'numeric',
                crosshairs: {
                    show: true,
                    position: 'back',
                    fill: {
                        type: 'color',
                        color: 'var(--fuse-border)',
                    },
                    width: 3,
                    stroke: {
                        dashArray: 0,
                        width: 0,
                    },
                    opacity: 0.9,
                },
                tickAmount: 8,
                axisTicks: {
                    show: true,
                    color: 'var(--fuse-border)',
                },
                axisBorder: {
                    show: false,
                },
                tooltip: {
                    enabled: false,
                },
                labels: {
                    show: true,
                    trim: false,
                    rotate: 0,
                    minHeight: 40,
                    hideOverlappingLabels: true,
                    formatter: (value): string =>
                        DateTime.now()
                            .minus({ minutes: Math.abs(parseInt(value, 10)) })
                            .toFormat('HH:mm'),
                    style: {
                        colors: 'currentColor',
                    },
                },
            },
            yaxis: {
                axisTicks: {
                    show: true,
                    color: 'var(--fuse-border)',
                },
                axisBorder: {
                    show: false,
                },
                forceNiceScale: true,
                labels: {
                    minWidth: 40,
                    formatter: (value: number): string =>
                        '$' + value.toFixed(0),
                    style: {
                        colors: 'currentColor',
                    },
                },
            },
        };

        // Watchlist options
        this.watchlistChartOptions = {
            chart: {
                animations: {
                    enabled: false,
                },
                width: '100%',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#A0AEC0'],
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            tooltip: {
                enabled: false,
            },
            xaxis: {
                type: 'category',
            },
        };
    }

    sendCurrency(): void {
        this.getTrendingCurrencies();
    }

    selectCoin(coin: any): void {
        this.graphicalData = {};
        this.getGraphicalCurrency(coin.id);
        this.selectedCoin.name = coin.name;
        this.selectedCoin.symbol = coin.symbol;
    }

    private getTrendingCurrencies(): void {
        this._cryptoService
            .getTrendingCurrencies(this.selectedCurrency)
            .subscribe((res) => {
                this.trendingCurrencies = res;

                this._changeDetectorRef.markForCheck();
            });
    }

    private getGraphicalCurrency(coinId = 'bitcoin'): void {
        this._cryptoService.getGraphicalCurrency(coinId).subscribe((res) => {
            this.graphicalData = [
                {
                    name: 'Price',
                    data: res.prices.map(([x, y]) => ({ x, y })),
                },
            ];

            this._prepareChartData();
            this._changeDetectorRef.markForCheck();
        });
    }
}
