import cds, { Request, Service } from '@sap/cds';
import { Customers, Products, SalesOrderItem, SalesOrderItems, SalesOrderHeader, SalesOrderHeaders } from '@models/sales';
import { customerController } from './factories/controllers/customer';
import { salesOrderHeaderController } from './factories/controllers/sales-order-header';
import { FullRequestParams } from './protocols';

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

    service.after('READ', 'Customers', (customersList: Customers, request)=>{
        (request as unknown as FullRequestParams<Customers>).results = customerController.afterRead(customersList);
    })

    service.before('CREATE', 'SalesOrderHeaders', async (request: Request)=>{
        const result = await salesOrderHeaderController.beforeCreate(request.data);
        if (result.hasError) {
            request.reject(400,result.error?.message as string);
        }
        request.data.totalAmount = result.totalAmount;
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