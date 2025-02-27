import { Routes } from '@angular/router';
import { CryptoComponent } from './crypto.component';
import { inject } from '@angular/core';
import { CryptoService } from './crypto.service';

export default [
    {
        path: '',
        component: CryptoComponent,
        resolve  : {
          data: () => inject(CryptoService).getData(),
      },
    },
] as Routes;
