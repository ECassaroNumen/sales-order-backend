import { CustomerRepositoryImpl } from "srv/repositories/customer/implementatin";
import { ProductRepositoryImpl } from "srv/repositories/product/implementation";
import { SalesOrderHeaderServiceImpl } from "srv/services/sales-order-header/implementation";
import { SalesOrderHeaderService } from "srv/services/sales-order-header/protocol";

const makeSalesOrderHeaderService = ():SalesOrderHeaderService => {
    const customerRepository = new CustomerRepositoryImpl();
    const productRepository =  new ProductRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository,productRepository);
}

export const salesOrderHeaderService = makeSalesOrderHeaderService();