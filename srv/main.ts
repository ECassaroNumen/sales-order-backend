import cds, { Request, Service } from '@sap/cds';
import { Customers, Products, SalesOrderItem, SalesOrderItems } from '@models/sales';

export default (service: Service)=>{
    service.after('READ', 'Customers', (results: Customers)=>{
        console.log('>>> Results from Customers:', results);
    })

    service.before('CREATE', 'SalesOrderHeaders', async (request: Request)=>{
        const params = request.data
        const items: SalesOrderItems = params.items;

        if (!params.items || params.items?.length === 0) {
            request.reject(400, 'At least one item is required');
        }

        if (!params.customer_id) {
            request.reject(400, 'customer_id is required');
        }

        const customerQuery = SELECT.one.from('sales.Customers').where({ id: params.customer_id } )

        const customer = await cds.run(customerQuery);

        if (!customer) {
            request.reject(404, `Customer with id ${params.customer_id} not found`);
        }

        //validar os produtos dos items
        const productIds: String[] = params.items.map((item: SalesOrderItem)=> item.product_id);
        const productQuery = SELECT.from('sales.Products').where( { id: productIds } );
        const products: Products = await cds.run(productQuery);
        const dbProducts = products.map( (product) => product.id );

        for (const item of items) {
            const dbProduct = products.find( (product) => product.id === item.product_id );            
            if (!dbProduct) {
                request.reject(404, `Product with id ${item.product_id} not found`);
            }
            if (dbProduct?.stock === 0) {
                request.reject(400, `Product ${dbProduct.name} is out of stock`);
            }
        }
    });
}