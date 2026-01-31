# RLS Policy Testing Guide

This directory contains comprehensive tests for Row Level Security (RLS) policies that ensure proper data access control across all database tables.

## Test Files

### 1. `rls-policies-mock.test.ts`
- **Purpose**: Mock-based tests that verify RLS policy logic without requiring a live database
- **Runs**: Always (part of standard test suite)
- **Coverage**: Tests the expected behavior of RLS policies using mocked Supabase responses
- **Use Case**: CI/CD pipelines, quick development feedback

### 2. `rls-policies.test.ts`
- **Purpose**: Integration tests with live Supabase database
- **Runs**: Only when local Supabase is running
- **Coverage**: End-to-end verification of actual RLS policy enforcement
- **Use Case**: Local development, comprehensive testing before deployment

### 3. `rls-property-tests.test.ts`
- **Purpose**: Property-based tests using fast-check library
- **Runs**: Only when local Supabase is running
- **Coverage**: Universal correctness properties across randomized inputs
- **Use Case**: Discovering edge cases, ensuring universal correctness

## Running Tests

### Quick Tests (Mock-based)
```bash
# Run mock tests (no database required)
npm test rls-policies-mock.test.ts
```

### Full Integration Tests
```bash
# 1. Start Docker Desktop
# 2. Start local Supabase
npx supabase start

# 3. Run integration tests
npm test rls-policies.test.ts

# 4. Run property-based tests
npm test rls-property-tests.test.ts
```

### All RLS Tests
```bash
# Run all RLS-related tests
npm test __tests__/rls
```

## Test Coverage

### Tables Tested
- ✅ `users` - User profile access control
- ✅ `gardens` - Garden data access (private/public)
- ✅ `media_assets` - Media file access control
- ✅ `garden_views` - Analytics access control

### Access Scenarios Tested
- ✅ Users accessing their own data
- ✅ Users attempting to access other users' private data
- ✅ Users accessing public data from other users
- ✅ Anonymous users accessing public data
- ✅ Anonymous users attempting to access private data
- ✅ Bulk queries filtering unauthorized data
- ✅ CRUD operations with proper authorization
- ✅ CRUD operations with unauthorized access attempts

### Property-Based Test Properties
- **Property 1**: Data Access Control - Users can only access their own private data or public data
- **Property 2**: Garden Analytics Access Control - Only garden owners can view analytics

## Requirements Validated

- **Requirement 1.3**: RLS policies implemented for all database tables
- **Requirement 2.5**: User-specific data access controls enforced
- **Requirement 9.1**: Users prevented from accessing other users' private data

## Test Data Management

### Mock Tests
- Use Jest mocks to simulate Supabase responses
- No database cleanup required
- Fast execution, suitable for CI/CD

### Integration Tests
- Create temporary test users and data
- Automatic cleanup after each test
- Requires local Supabase instance

### Property Tests
- Generate randomized test data using fast-check
- Test universal properties across many inputs
- Automatic shrinking to minimal failing cases

## Troubleshooting

### Docker Issues
```bash
# Check Docker Desktop is running
docker --version

# Restart Docker Desktop if needed
```

### Supabase Issues
```bash
# Check Supabase status
npx supabase status

# Reset local database if needed
npx supabase db reset

# View logs for debugging
npx supabase logs
```

### Test Failures
1. **Mock tests failing**: Check Jest configuration and mock setup
2. **Integration tests failing**: Verify Supabase is running and accessible
3. **Property tests failing**: Check test data generators and cleanup logic
4. **Timeout errors**: Increase test timeout for slow operations

## Adding New RLS Tests

### For New Tables
1. Add table-specific tests to `rls-policies.test.ts`
2. Add corresponding mock tests to `rls-policies-mock.test.ts`
3. Create property-based tests if applicable
4. Update this README with new coverage

### For New Access Patterns
1. Identify the access control requirement
2. Write unit tests for specific scenarios
3. Add property tests for universal behavior
4. Document the new test coverage

## Performance Considerations

- Mock tests: ~100ms per test
- Integration tests: ~1-5s per test (database operations)
- Property tests: ~10-30s per property (multiple iterations)

Optimize test performance by:
- Using mocks for quick feedback
- Running integration tests in parallel where possible
- Limiting property test iterations for faster CI
- Cleaning up test data efficiently