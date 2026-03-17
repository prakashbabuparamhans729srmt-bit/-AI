"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun, Monitor } from "lucide-react"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">सेटिंग्स</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>थीम</CardTitle>
          <CardDescription>ऐप की उपस्थिति को अनुकूलित करें।</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme("light")}
            className="w-full sm:w-auto"
          >
            <Sun className="mr-2" />
            लाइट मोड
          </Button>
          <Button 
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme("dark")}
            className="w-full sm:w-auto"
          >
            <Moon className="mr-2" />
            डार्क मोड
          </Button>
          <Button 
            variant={theme === 'system' ? 'default' : 'outline'}
            onClick={() => setTheme("system")}
            className="w-full sm:w-auto"
          >
            <Monitor className="mr-2" />
            सिस्टम डिफ़ॉल्ट
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
