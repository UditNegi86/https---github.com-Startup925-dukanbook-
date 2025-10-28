import { UserRoute } from "../components/ProtectedRoute";
import { SharedLayout } from "../components/SharedLayout";
import { ModuleRoute } from "../components/ModuleRoute";

export default [SharedLayout, UserRoute, ModuleRoute('marketplace')];