import { Service } from '@sap/cds';
import { Customers } from '@models/sales';

export default (service: Service)=>{
    service.after('READ', 'Customers', (results: Customers)=>{
        console.log('>>> Results from Customers:', results);
    })
}