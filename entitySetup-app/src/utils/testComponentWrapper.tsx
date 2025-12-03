import React from 'react';

// Test-specific component wrapper that replaces React.lazy() in test environment
// This file is ONLY used in test environment and has ZERO impact on production

interface TestComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Test-specific Suspense wrapper that doesn't use React.lazy()
export const TestSuspense: React.FC<TestComponentWrapperProps> = ({ children, fallback }) => {
  // In test environment, render children directly without Suspense
  return <>{children}</>;
};

// Test-specific lazy component creator
export const createTestLazyComponent = (componentName: string) => {
  return React.forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} data-testid={`test-${componentName.toLowerCase()}`} {...props}>
      Test {componentName}
    </div>
  ));
};

// Test-specific dynamic import handler
export const testDynamicImport = (moduleName: string) => {
  return Promise.resolve({
    default: createTestLazyComponent(moduleName.split('/').pop() ?? 'Unknown')
  });
};
