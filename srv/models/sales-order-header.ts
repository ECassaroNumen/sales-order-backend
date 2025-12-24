// key id: UUID;
// customer: Association to Customers;
// totalAmount: Decimal(15,2);
// items: Composition of many SalesOrderItems on items.header = $self;

import { SalesOrderItemModel } from "./sales-order-item";

type SalesOrderHeaderProps = {
    id: string;
    customer_id: string;
    totalAmount: number;
    items: SalesOrderItemModel[];
}

type SalesOrderHeaderPropsWithoutTotalAmount = Omit<SalesOrderHeaderProps, 'id' | 'totalAmount'>;

type CreationPayload = {
    customer_id: SalesOrderHeaderProps['customer_id'];
}

type CreationPayloadValidationResult = {
    hasError: boolean;
    error?: Error;
}

export class SalesOrderHeaderModel {
    constructor(private props: SalesOrderHeaderProps) {}

    public static create(props: SalesOrderHeaderPropsWithoutTotalAmount): SalesOrderHeaderModel {
        return new SalesOrderHeaderModel({
            ...props,
            id: crypto.randomUUID(),
            totalAmount: 0,
        });
    }
    
    public get id(): string {
        return this.props.id;
    }
    public get customer_id(): string {
        return this.props.customer_id;
    }

    public get items() {
        return this.props.items;
    }

    public get totalAmount(): number {
        return this.props.totalAmount;
    }

    public set totalAmount(value: number) {
        this.props.totalAmount = value;
    }

    public validateCreationPayload(params: CreationPayload): CreationPayloadValidationResult {
        const customerValidation = this.validateCustomerOnCreation(params.customer_id);
        if (customerValidation.hasError) {
            return customerValidation;
        }
        const itemsValidation = this.validateItemsOnCreation(this.items);
        if (itemsValidation.hasError) {
            return itemsValidation;
        }
        return { hasError: false  };
    }

    private validateCustomerOnCreation(customerId: CreationPayload['customer_id']): CreationPayloadValidationResult {
        if (!customerId) {
            return { 
                hasError: true, 
                error: new Error('Customer invalid') 
            };
        }
        return { hasError: false };
    }

    private validateItemsOnCreation(items: SalesOrderHeaderProps['items']): CreationPayloadValidationResult {
        if (!items || items?.length === 0) {
            return { 
                hasError: true, 
                error: new Error('Itens inválidos') 
            };
        }
        const itemsErrors: string[] = [];   
        items.forEach( (item) => {
            const validationResult = item.validateCreationPayload({ product_id: item.productId });
            if (validationResult.hasError) {
                itemsErrors.push(validationResult.error?.message as string);
            }
        });
        if (itemsErrors.length > 0) {
            const messages = itemsErrors.join('\n -');
            return {
                hasError: true,
                error: new Error(messages)
            };
        }        
        return { hasError: false };
    };    

    public calculateTotalAmount(): number {
        let totalAmount = 0;
        this.items.forEach((item) => {
            totalAmount += ( (item.price as number) * (item.quantity as number) );
        });
        return totalAmount;
    }

    public calculateDiscount(): number {
        let totalAmount = this.calculateTotalAmount();
        if (totalAmount > 30000) {
            const discount = totalAmount * 0.1;
            totalAmount = totalAmount - discount;
        }
        return totalAmount;        
    };
}
