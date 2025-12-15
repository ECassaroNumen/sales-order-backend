using { sales } from '../db/schema';

@requires: 'authenticated-user'
service MainService {
    entity SalesOrderHeaders as projection on sales.SalesOrderHeaders;

    @restrict: [
        {
            grant: 'READ',
            to: 'read_only_user'
        }
    ]    
    entity Customers as projection on sales.Customers;

    @restrict: [
        {
            grant: 'READ',
            to: 'read_only_user'
        },
        {
            grant: ['READ','WRITE'],
            to: 'admin'
        }
    ]
    entity Products as projection on sales.Products;
}