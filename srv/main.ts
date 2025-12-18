import cds, { Request, Service } from '@sap/cds';
import { Customers, Products, SalesOrderItem, SalesOrderItems, SalesOrderHeader, SalesOrderHeaders } from '@models/sales';

export default (service: Service)=>{
    service.before('READ',"*", (req: Request)=>{
        if (!req.user.is('read_only_user')) {
            req.reject(403, 'Forbidden. Precisaria ser read_only_user');
        }
    });
    service.before(['WRITE','DELETE'],"*", (req: Request)=>{
        if (!req.user.is('admin')) {
            req.reject(403, 'Forbidden.  Precisaria ser admin');
        }
    });    

    service.after('READ', 'Customers', (results: Customers)=>{
        // console.log('>>> Results from Customers:', results);
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

        let totalAmount = 0;
        items.forEach((item) => {
            totalAmount += ( (item.price as number) * (item.quantity as number) );
        });
        if (totalAmount > 30000) {
            const discount = totalAmount * 0.1;
            totalAmount = totalAmount - discount;
        }
        request.data.totalAmount = totalAmount;
    });

    service.after('CREATE', 'SalesOrderHeaders', async (results: SalesOrderHeaders, request: Request)=>{
        const headerAsArray: SalesOrderHeaders = Array.isArray(results) ? results : [results];        

        for (const header of headerAsArray) {
            const items  = header.items as SalesOrderItems;
            const productsData = items.map(item => ({
                id: item.product_id as String,
                quantity: item.quantity as Number,
            }));
            const productIds = productsData.map(productData => productData.id);
            const productsQuery = SELECT.from('sales.Products').where( { id: productIds } );
            const products: Products = await cds.run(productsQuery);
            for (const productData of productsData) {
                const foundProduct = products.find( (product) => product.id === productData.id );
                if (foundProduct && foundProduct.stock !== undefined) {
                    foundProduct.stock = (foundProduct.stock as number) - (productData.quantity as number);
                    await cds.update('sales.Products').where( { id: foundProduct.id } ).with({ stock: foundProduct.stock });
                }
            }

            const headerAsString = JSON.stringify(header);
            const userAsString = JSON.stringify(request.user);
            const log = [{
                header_id: header.id,
                orderData: headerAsString,
                userData: userAsString
            }];            

            await cds.create('sales.SalesOrderLogs').entries(log);
        }
    });
}