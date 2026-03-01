import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WorkInProgressPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">🏗️ निर्माणाधीन</CardTitle>
          <CardDescription className="text-lg">यह पेज अभी बन रहा है। जल्द ही वापस आएं!</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
