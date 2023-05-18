using System.Text.Json.Serialization;

namespace Wyan;

public record ClickablePanel
{
    [JsonPropertyName("image")]
    public string? Image { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("subtitle")]
    public string? Subtitle { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("content")]
    public string? Content { get; set; }
}
