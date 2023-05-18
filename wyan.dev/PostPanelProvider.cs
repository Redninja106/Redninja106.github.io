using Microsoft.AspNetCore.Components;
using System.Text.Json;

namespace Wyan;

public class PostPanelProvider : IClickablePanelProvider
{
    private List<ClickablePanel>? panels;

    public HttpClient HttpClient { get; }

    public PostPanelProvider(HttpClient client)
    {
        this.HttpClient = client;
    }

    public async Task<IEnumerable<ClickablePanel>> GetPanels()
    {
        if (panels is null)
        {
            panels = new();

            string files = await GetFileContentAsync(HttpClient, "directory.txt");

            foreach (var file in files.Split(Environment.NewLine))
            {
                if (string.IsNullOrEmpty(file) || file.StartsWith('#'))
                    continue;

                ClickablePanel? panel = null;
                try
                {
                    string postInfo = await GetFileContentAsync(HttpClient, file);
                    
                    panel = JsonSerializer.Deserialize<ClickablePanel>(postInfo);
                }
                catch (Exception ex)
                {
                    await Console.Out.WriteLineAsync(ex.ToString());
                }

                if (panel is null)
                {
                    await Console.Out.WriteLineAsync("Error loading panel '" + file + "'");
                }
                else
                {
                    panels.Add(panel);
                }
            }
        }

        return panels;
    }

    public static async Task<string> GetFileContentAsync(HttpClient httpClient, string fileName)
    {
        const string baseUrl = "https://raw.githubusercontent.com/Redninja106/wyan-dev-data/master/";

        var response = await httpClient.GetAsync(baseUrl + fileName);

        return await response.Content.ReadAsStringAsync();
    }
}
