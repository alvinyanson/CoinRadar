import {
    AsyncPipe,
    CurrencyPipe,
    DecimalPipe,
    NgClass,
    NgFor,
    NgIf,
    UpperCasePipe,
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { DateTime } from 'luxon';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { CryptoService, SUPPORTED_CURRENCIES } from './crypto.service';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';

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
        MatAutocompleteModule,
        MatSelectModule,
        MatInputModule,
        ReactiveFormsModule,
        MatOptionModule,
        NgIf,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        UpperCasePipe,
        DecimalPipe,
        CurrencyPipe,
        AsyncPipe,
    ],
})
export class CryptoComponent implements OnInit, OnDestroy {
    btcOptions: ApexOptions = {};
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;

    selectedCurrency = 'USD';
    selectedCoin = { name: 'Bitcoin', symbol: 'btc' };
    trendingCurrencies: any[] = [];
    graphicalData: any;
    supportedCurrencies: string[] = [];
    currencyCtrl = new FormControl('USD');
    filteredCurrencies: Observable<string[]>;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _cryptoService: CryptoService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    ngOnInit(): void {
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

        this.onSearchCurrency();

        this.onSelectCurrency();
    }

    currencySelected(item: MatAutocompleteSelectedEvent): void {
        this.selectedCurrency = item.option.value;
        this._cryptoService.setCurrency(this.selectedCurrency);
    }

    selectCoin(coin: any): void {
        this.graphicalData = {};
        this.getGraphicalDataForCoin(coin.id);
        this.selectedCoin.name = coin.name;
        this.selectedCoin.symbol = coin.symbol;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private onSelectCurrency(): void {
        this._cryptoService.selectedCurrency$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.getCoinsByMarketCap();
                this.getGraphicalDataForCoin();
            });
    }

    private onSearchCurrency(): void {
        this.filteredCurrencies = this.currencyCtrl.valueChanges.pipe(
            startWith(''),
            map((currency) =>
                currency
                    ? this._cryptoService.filterCurrencies(currency)
                    : this._cryptoService.getSupportedCurrencies()
            )
        );
    }

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
                        this.getCurrencySymbol(this.selectedCurrency) +
                        value.toFixed(2),
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
                        DateTime.fromMillis(+value).toFormat(
                            'yyyy-MM-dd HH:mm:ss'
                        ),
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
                        this.getCurrencySymbol(this.selectedCurrency) +
                        value.toFixed(0),
                    style: {
                        colors: 'currentColor',
                    },
                },
            },
        };
    }

    private getCoinsByMarketCap(): void {
        this._cryptoService
            .getCoinsByMarketCap(this.selectedCurrency)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.trendingCurrencies = data;
                this._changeDetectorRef.markForCheck();
            });
    }

    private getGraphicalDataForCoin(coinId = 'bitcoin'): void {
        this._cryptoService
            .getGraphicalDataForCoin(coinId, this.selectedCurrency)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.graphicalData = [
                    {
                        name: 'Price',
                        data: data.prices.map(([x, y]) => ({ x, y })),
                    },
                ];

                this._prepareChartData();
                this._changeDetectorRef.markForCheck();
            });
    }

    private getCurrencySymbol(currency: string): string {
        return this._cryptoService.getCurrencySymbol(currency);
    }
}
