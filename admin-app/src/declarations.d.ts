declare module "commonApp/*" {
    const Component: React.ComponentType<any>;
    export default Component;
}

declare module "homeApp/*" {
    const Component: React.ComponentType<any>;
    export default Component;
}

declare module "budgetingApp/*" {
    const Component: React.ComponentType<any>;
    export default Component;
}

declare module "entitySetupApp/*" {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module "dataManagementApp/*" {
    const Component: React.ComponentType<any>;
    export default Component;
}

declare module "userManagementApp/*" {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module "commonApp" {
    export * from "commonApp/*";
}

declare module "homeApp" {
    export * from "homeApp/*";
}

declare module "budgetingApp" {
    export * from "budgetingApp/*";
}

declare module "entitySetupApp" {
    export * from "entitySetupApp/*";
}
