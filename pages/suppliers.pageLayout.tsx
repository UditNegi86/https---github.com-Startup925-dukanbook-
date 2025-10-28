import { SharedLayout } from "../components/SharedLayout";
import { UserRoute } from "../components/ProtectedRoute";
import { ModuleRoute } from "../components/ModuleRoute";

export default [SharedLayout, UserRoute, ModuleRoute('suppliers')];