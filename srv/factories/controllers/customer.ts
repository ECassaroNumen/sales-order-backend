import { CustomerControllerImpl } from "srv/controllers/customer/implementation"; 
import { CustomerController } from "srv/controllers/customer/protocols";
import { customerService as CustomerService } from "../services/customer";

const makeCustomerController = (): CustomerController => {
    return new CustomerControllerImpl(CustomerService);
}

export const customerController = makeCustomerController();