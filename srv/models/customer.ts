// key id: UUID;
// firstName: String(20);
// lastName: String(100);
// email: String(255);

type CustomerProps = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export class CustomerModel {
    constructor(private props: CustomerProps ) { }

    public static create(props: CustomerProps): CustomerModel {
        return new CustomerModel(props);
    }

    public get_id(): string {
        return this.props.id;
    }

    public get_firstName(): string {
        return this.props.firstName;
    }

    public get_lastName(): string {
        return this.props.lastName;
    }

    public get_email(): string {
        return this.props.email;
    }

    public setDefaultEmailDomain() {
        if (!this.props.email?.includes('@')) {
            this.props.email = `${this.props.email}@gmail.com`;
        }
    }

    public toObject(): CustomerProps {
        return {
            id: this.props.id,
            firstName: this.props.firstName,
            lastName: this.props.lastName,
            email: this.props.email
        };
    }
}