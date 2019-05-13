'use strict';

import * as _ from 'lodash';
import { AbstractDto } from './common/dto/AbstractDto';
import { AbstractEntity } from './common/abstract.entity';

declare global {
// tslint:disable-next-line:naming-convention no-unused
    interface Array<T> {
        toDtos<B extends AbstractDto>(this: Array<AbstractEntity<B>>): B[];
    }
}

Array.prototype.toDtos = function<B extends AbstractDto>(): B[] {
    // tslint:disable-next-line:no-invalid-this
    return <B[]>_(this).map((item) => item.toDto()).compact().value();
};
