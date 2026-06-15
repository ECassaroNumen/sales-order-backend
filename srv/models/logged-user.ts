type LoggedUserProps = {
    id: string,
    roles: string[],
    attributes: LoggedUserAttibuteProps
}

type LoggedUserAttibuteProps = {
    id: number,
    groups: string[]
}

export class LoggedUserModel {
    constructor(private props: LoggedUserProps) {}

    public static create(props: LoggedUserProps) {
        return new LoggedUserModel(props);
    }

    get id(): string {
        return this.props.id;
    }

    get roles(): string[] {
        return this.props.roles;
    }

    get attributes(): LoggedUserAttibuteProps {
        return this.props.attributes;
    }

    public toStringfiedObject(): string {
        return JSON.stringify(this.props);
    }
}
