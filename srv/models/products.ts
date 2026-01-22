    // key id: UUID;
    // name: String(255);
    // price: Decimal(15,2);
    // stock: Integer;

export type ProductProps = {
    id: string;
    name: string;
    price: number;
    stock: number;
}

export type SellValidationResult = {
    hasError: boolean;
    error?: Error;
}

export class ProductModel {
    constructor(private props: ProductProps ) { }

    public static with(props: ProductProps): ProductModel {
        return new ProductModel(props);
    }

    public get id(): string {
        return this.props.id;
    }

    public get name(): string {
        return this.props.name;
    }

    public get price(): number {
        return this.props.price;
    }

    public get stock(): number {
        return this.props.stock;
    }

    public set stock(stock: number) {
        this.props.stock = stock;
    }

    public sell(amount: number): SellValidationResult {
        if (this.props.stock < amount ) {
            return {
                hasError: true,
                error: new Error('Quantidade de produto insuficiente em estoque'),
            };
        }
        this.stock -= amount;
        return { hasError: false };
    }
}