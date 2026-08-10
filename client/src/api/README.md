# Frontend API Architecture Rule

Per the project rules, **all API interactions must be routed through this structured layer.** We do not use raw `axios` calls directly inside React components.

## Architecture Guidelines
1. **Core Base Class (`core/Api.ts`)**: Manages the underlying Axios instance, authentication headers (via interceptors), and base URL. 
2. **Domain Services (`services/*.ts`)**: Every domain feature (Auth, Users, Transcription, etc.) MUST have an API class that extends the base `Api` class.
3. **Component Interaction**: React components MUST use `@tanstack/react-query` (`useQuery`, `useMutation`) to interact with these domain services, ensuring consistent loading, error, and caching states.

**Example Implementation Flow:**
```typescript
// 1. Create Service
class FeatureApi extends Api {
  async getData() {
    return (await this.get('/feature')).data;
  }
}
export const featureApi = new FeatureApi();

// 2. Use in Component with React Query
const { data, isLoading } = useQuery({ 
  queryKey: ['feature'], 
  queryFn: () => featureApi.getData() 
});
```
